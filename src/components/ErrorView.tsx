import { List, Icon, Action, ActionPanel } from "@raycast/api";

type Props = {
    msg?: string;
};

export default function ErrorView({ msg }: Props) {
    return (
        <List>
            <List.EmptyView
                icon={Icon.Warning}
                title={msg ?? "Fail to Load PicGo Config"}
                description="Make sure you installed picgo and setup configs"
                actions={
                    <ActionPanel>
                        <Action.OpenInBrowser
                            title="View Installation Guide"
                            url="https://docs.picgo.app/core/"
                        ></Action.OpenInBrowser>
                    </ActionPanel>
                }
            ></List.EmptyView>
        </List>
    );
}
