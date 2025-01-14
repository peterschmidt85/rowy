import { useAtom } from "jotai";
import { useLocation, useParams, Link as RouterLink } from "react-router-dom";
import { find, camelCase, uniq } from "lodash-es";

import {
  Stack,
  StackProps,
  Breadcrumbs,
  Link,
  Typography,
  Tooltip,
} from "@mui/material";
import ReadOnlyIcon from "@mui/icons-material/EditOffOutlined";

import InfoTooltip from "@src/components/InfoTooltip";
import RenderedMarkdown from "@src/components/RenderedMarkdown";

import {
  globalScope,
  userRolesAtom,
  tableDescriptionDismissedAtom,
  tablesAtom,
} from "@src/atoms/globalScope";
import { ROUTES } from "@src/constants/routes";

/**
 * Breadcrumbs is rendered by the Navigation component,
 * so it does not have access to tableScope
 */
export default function BreadcrumbsTableRoot(props: StackProps) {
  const { id } = useParams();

  const [userRoles] = useAtom(userRolesAtom, globalScope);
  const [dismissed, setDismissed] = useAtom(
    tableDescriptionDismissedAtom,
    globalScope
  );
  const [tables] = useAtom(tablesAtom, globalScope);

  const tableSettings = find(tables, ["id", id]);
  if (!tableSettings) return null;

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} {...props}>
      <Breadcrumbs
        aria-label="Table breadcrumbs"
        sx={{
          typography: "button",
          fontSize: (theme) => theme.typography.h6.fontSize,
          color: "text.disabled",

          "& .MuiBreadcrumbs-ol": {
            userSelect: "none",
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
          },
          "& .MuiBreadcrumbs-li": { display: "flex" },
          "& .MuiTypography-inherit": { typography: "h6" },
        }}
      >
        <Link
          component={RouterLink}
          to={`${ROUTES.home}#${camelCase(tableSettings.section)}`}
          color="text.secondary"
          underline="hover"
        >
          {tableSettings.section}
        </Link>

        <Typography variant="inherit" color="text.primary">
          {tableSettings.name}
        </Typography>
      </Breadcrumbs>

      {tableSettings.readOnly && (
        <Tooltip
          title={
            userRoles.includes("ADMIN")
              ? "Table is read-only for non-ADMIN users"
              : "Table is read-only"
          }
        >
          <ReadOnlyIcon fontSize="small" sx={{ ml: 0.5 }} color="action" />
        </Tooltip>
      )}

      {tableSettings.description && (
        <InfoTooltip
          description={
            <div>
              <RenderedMarkdown
                children={tableSettings.description}
                restrictionPreset="singleLine"
              />
            </div>
          }
          buttonLabel="Table info"
          tooltipProps={{
            componentsProps: {
              popper: { sx: { zIndex: "appBar" } },
              tooltip: { sx: { maxWidth: "75vw" } },
            } as any,
          }}
          defaultOpen={!dismissed.includes(tableSettings.id)}
          onClose={() => setDismissed((d) => uniq([...d, tableSettings.id]))}
        />
      )}
    </Stack>
  );
}
