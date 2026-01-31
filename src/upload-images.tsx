import {
    Action,
    ActionPanel,
    Form,
    Clipboard,
    Icon,
    showToast,
    Toast,
    List,
    useNavigation,
    openExtensionPreferences,
    getPreferenceValues,
} from "@raycast/api";

import useUploaderConfig from "./hooks/config";
import ConfigDropdownList from "./components/ConfigDropdown";
import { uploaderTypes, initialConfig } from "./util/context";
import type { UserUploaderConfig, UploadFormData } from "./types/type";
import { isImgFile } from "./util/util";
import { ctx } from "./util/context";
import { withTimeout } from "./util/util";
import UploadResultPage from "./components/UploadResultPage";

export default function Command() {
    if (!initialConfig.type || !initialConfig.configName) {
        return (
            <List>
                <List.EmptyView
                    icon={Icon.Warning}
                    title="Fail to Load PicGo Config"
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
    const { uploaderConfig, setUploaderConfig, isLoading } = useUploaderConfig(initialConfig);
    const { push } = useNavigation();

    const { uploadTimeout } = getPreferenceValues<ExtensionPreferences>();

    async function uploadImgs(input?: string[]) {
        const toast = await showToast(
            Toast.Style.Animated,
            "Uploading...",
            `${uploaderConfig?.type} [${uploaderConfig?.configName}]`,
        );
        try {
            const timeout = Number(uploadTimeout);
            const res = await withTimeout(ctx.upload(input), timeout, `Upload timeout: ${timeout / 1000}s`);
            if (res instanceof Error) throw res;
            if (res.length === 0) throw new Error("No result returned");
            const urls = res.filter((r) => r.imgUrl).map((r) => r.imgUrl);
            if (urls.length === 0) throw new Error("No url result returned");

            toast.style = Toast.Style.Success;
            toast.title = "Success";
            push(<UploadResultPage result={res} />);
        } catch (err) {
            const e = err as Error;
            console.error("Upload failed:", e);
            toast.style = Toast.Style.Failure;
            toast.title = "Upload Failed";
            toast.message = e.message;
            toast.primaryAction = {
                title: "Copy Error Log",
                shortcut: { modifiers: ["cmd", "shift"], key: "f" },
                onAction: (toast) => {
                    Clipboard.copy(JSON.stringify(e.stack));
                    toast.hide();
                },
            };
        }
    }

    async function handleFilesUpload(data: UploadFormData) {
        const { files } = data;
        const imgs = files.filter((f) => isImgFile(f));
        if (imgs.length === 0) {
            showToast(Toast.Style.Failure, "Error", "Please pick image files.");
            return false;
        }
        await uploadImgs(files);
    }

    async function handleClipboardUpload() {
        await uploadImgs();
    }

    if (isLoading) return <Form actions={null} isLoading={true} />;

    return (
        <Form
            isLoading={isLoading}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Upload Image" icon={Icon.Upload} onSubmit={handleFilesUpload} />
                    <Action
                        title="Quick Upload from Clipboard"
                        icon={Icon.Clipboard}
                        shortcut={{ modifiers: ["cmd"], key: "v" }}
                        onAction={handleClipboardUpload}
                    />
                    <Action title="Open Extension Preferences" onAction={openExtensionPreferences} icon={Icon.Cog} />
                </ActionPanel>
            }
        >
            <Form.Dropdown
                isLoading={isLoading}
                id="uploader_config"
                title="Uploader Config"
                value={JSON.stringify(uploaderConfig)}
                onChange={async (data) => {
                    const cfg = JSON.parse(data) as UserUploaderConfig;
                    await setUploaderConfig(cfg);
                }}
            >
                <ConfigDropdownList uploaderTypes={uploaderTypes}></ConfigDropdownList>
            </Form.Dropdown>
            <Form.Separator />
            <Form.FilePicker
                autoFocus
                id="files"
                title="Select from Files"
                canChooseDirectories={false}
                canChooseFiles
                allowMultipleSelection
            />
            <Form.Description
                title="Quick Tips"
                text={`• ⌘ + V: Quick Upload from Clipboard\n• ⌘ + Enter: Submit and upload`}
            />
        </Form>
    );
}
