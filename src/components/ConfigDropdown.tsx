import { Form, Icon } from "@raycast/api";
import { IUploaderConfigItem } from "picgo";
import { UserUploaderConfig } from "../types/type";

interface Props {
    uploaderTypes: string[];
    getConfigList: (s: string) => IUploaderConfigItem[];
}

export default function ConfigDropdownList({ uploaderTypes, getConfigList }: Props) {
    return uploaderTypes.map((t) => (
        <Form.Dropdown.Section key={t} title={t}>
            {(() => {
                return getConfigList(t).map((cfg) => (
                    <Form.Dropdown.Item
                        key={`${t}.${cfg._configName}`}
                        icon={Icon.Cog}
                        value={JSON.stringify({ uploaderType: t, configName: cfg._configName } as UserUploaderConfig)}
                        title={cfg._configName}
                    />
                ));
            })()}
        </Form.Dropdown.Section>
    ));
}
