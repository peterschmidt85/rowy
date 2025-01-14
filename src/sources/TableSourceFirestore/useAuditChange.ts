import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";

import {
  globalScope,
  rowyRunAtom,
  compatibleRowyRunVersionAtom,
  currentUserAtom,
} from "@src/atoms/globalScope";
import {
  tableScope,
  tableSettingsAtom,
  auditChangeAtom,
} from "@src/atoms/tableScope";
import { runRoutes } from "@src/constants/runRoutes";
import { rowyUser } from "@src/utils/table";

/**
 * Sets the value of auditChangeAtom
 */
export default function useAuditChange() {
  const setAuditChange = useSetAtom(auditChangeAtom, tableScope);
  const [rowyRun] = useAtom(rowyRunAtom, globalScope);
  const [currentUser] = useAtom(currentUserAtom, globalScope);

  const [compatibleRowyRunVersion] = useAtom(
    compatibleRowyRunVersionAtom,
    globalScope
  );
  const [tableSettings] = useAtom(tableSettingsAtom, tableScope);

  useEffect(() => {
    if (
      !tableSettings?.id ||
      !tableSettings?.collection ||
      !tableSettings.audit ||
      !compatibleRowyRunVersion({ minVersion: "1.1.1" })
    ) {
      setAuditChange(undefined);
      return;
    }

    setAuditChange(
      () =>
        (
          type: "ADD_ROW" | "UPDATE_CELL" | "DELETE_ROW",
          rowId: string,
          data?: { updatedField?: string }
        ) =>
          rowyRun({
            route: runRoutes.auditChange,
            body: {
              type,
              rowyUser: rowyUser(currentUser!),
              ref: {
                rowPath: tableSettings.collection,
                rowId,
                tableId: tableSettings.id,
                collectionPath: tableSettings.collection,
              },
              data,
            },
          }).catch(console.log)
    );

    return () => setAuditChange(undefined);
  }, [setAuditChange, rowyRun, compatibleRowyRunVersion, tableSettings]);
}
