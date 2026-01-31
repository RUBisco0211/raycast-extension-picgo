import { Form, Icon } from "@raycast/api";
import { getConfigList } from "../util/context";

interface Props {
    uploaderTypes: string[];
}

export default function ConfigDropdownList({ uploaderTypes }: Props) {
    return uploaderTypes.map((t) => (
        <Form.Dropdown.Section key={t} title={t}>
            {(() => {
                return getConfigList(t).map((cfg) => (
                    <Form.Dropdown.Item
                        key={cfg._configName}
                        icon={Icon.Cog}
                        value={JSON.stringify({ type: t, configName: cfg._configName })}
                        title={cfg._configName}
                    />
                ));
            })()}
        </Form.Dropdown.Section>
    ));
}
