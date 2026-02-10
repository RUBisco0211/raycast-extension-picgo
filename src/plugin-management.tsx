import { Icon, List } from "@raycast/api";
import getPicGoContext from "./util/context";
import { useMemo, useState } from "react";
import type { IPicGoPluginInterface } from "picgo";

export default function Command() {
    const { getInstalledPluginNameList, getEnabledPluginNameList, getPlugin } = getPicGoContext();

    const [updated, setUpdated] = useState<boolean>(false);
    const installedPlugins = useMemo(() => {
        return getInstalledPluginNameList()
            .map((n) => {
                return { name: n, ...getPlugin(n) };
            })
            .filter(Boolean);
    }, [updated]);

    return (
        <List isShowingDetail={installedPlugins.length > 0}>
            {installedPlugins.map((p) => {
                return <List.Item title={p.name} key={p.name} icon={Icon.Plug}></List.Item>;
            })}
        </List>
    );
}
