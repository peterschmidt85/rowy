import { useAtom, useSetAtom } from "jotai";
import type { CellContext } from "@tanstack/table-core";

import { Stack, Tooltip, IconButton, alpha } from "@mui/material";
import { CopyCells as CopyCellsIcon } from "@src/assets/icons";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import MenuIcon from "@mui/icons-material/MoreHoriz";

import {
  projectScope,
  userRolesAtom,
  tableAddRowIdTypeAtom,
  altPressAtom,
  confirmDialogAtom,
} from "@src/atoms/projectScope";
import {
  tableScope,
  tableSettingsAtom,
  addRowAtom,
  deleteRowAtom,
  contextMenuTargetAtom,
} from "@src/atoms/tableScope";
import { TableRow } from "@src/types/table";

export default function FinalColumn({
  row,
  focusInsideCell,
}: CellContext<TableRow, any> & { focusInsideCell: boolean }) {
  const [userRoles] = useAtom(userRolesAtom, projectScope);
  const [addRowIdType] = useAtom(tableAddRowIdTypeAtom, projectScope);
  const confirm = useSetAtom(confirmDialogAtom, projectScope);

  const [tableSettings] = useAtom(tableSettingsAtom, tableScope);
  const addRow = useSetAtom(addRowAtom, tableScope);
  const deleteRow = useSetAtom(deleteRowAtom, tableScope);
  const setContextMenuTarget = useSetAtom(contextMenuTargetAtom, tableScope);

  const [altPress] = useAtom(altPressAtom, projectScope);
  const handleDelete = () => deleteRow(row.original._rowy_ref.path);
  const handleDuplicate = () => {
    addRow({
      row: row.original,
      setId: addRowIdType === "custom" ? "decrement" : addRowIdType,
    });
  };

  if (!userRoles.includes("ADMIN") && tableSettings.readOnly === true)
    return null;

  return (
    <Stack
      direction="row"
      alignItems="center"
      style={{ height: "100%" }}
      gap={0.5}
    >
      <Tooltip title="Row menu">
        <IconButton
          size="small"
          color="inherit"
          onClick={(e) => {
            setContextMenuTarget(e.target as HTMLElement);
          }}
          className="row-hover-iconButton"
          tabIndex={focusInsideCell ? 0 : -1}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Duplicate row">
        <IconButton
          size="small"
          color="inherit"
          disabled={tableSettings.tableType === "collectionGroup"}
          onClick={
            altPress
              ? handleDuplicate
              : () => {
                  confirm({
                    title: "Duplicate row?",
                    body: (
                      <>
                        Row path:
                        <br />
                        <code
                          style={{ userSelect: "all", wordBreak: "break-all" }}
                        >
                          {row.original._rowy_ref.path}
                        </code>
                      </>
                    ),
                    confirm: "Duplicate",
                    handleConfirm: handleDuplicate,
                  });
                }
          }
          className="row-hover-iconButton"
          tabIndex={focusInsideCell ? 0 : -1}
        >
          <CopyCellsIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={`Delete row${altPress ? "" : "…"}`}>
        <IconButton
          size="small"
          color="inherit"
          onClick={
            altPress
              ? handleDelete
              : () => {
                  confirm({
                    title: "Delete row?",
                    body: (
                      <>
                        Row path:
                        <br />
                        <code
                          style={{ userSelect: "all", wordBreak: "break-all" }}
                        >
                          {row.original._rowy_ref.path}
                        </code>
                      </>
                    ),
                    confirm: "Delete",
                    confirmColor: "error",
                    handleConfirm: handleDelete,
                  });
                }
          }
          className="row-hover-iconButton"
          tabIndex={focusInsideCell ? 0 : -1}
          sx={{
            "[role='row']:hover .row-hover-iconButton&&, .row-hover-iconButton&&:focus":
              {
                color: "error.main",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.error.main,
                    theme.palette.action.hoverOpacity * 2
                  ),
              },
          }}
          disabled={!row.original._rowy_ref.path}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}