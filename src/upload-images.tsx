import {
    Action,
    ActionPanel,
    Form,
    Clipboard,
    Icon,
    showToast,
    Toast,
    useNavigation,
    openExtensionPreferences,
    getPreferenceValues,
} from "@raycast/api";

import ConfigDropdownList from "./components/ConfigDropdown";
import type { UserUploaderConfig, UploadFormData } from "./types/type";
import { isImgFile } from "./util/util";
import { withTimeout } from "./util/util";
import UploadResultPage from "./components/UploadResultPage";
import ErrorView from "./components/ErrorView";
import usePicGoContext from "./util/context";
import { useLocalStorage } from "@raycast/utils";
import { useMemo, useState } from "react";

const UPLOADER_CONFIG_KEY = "picgo:user_uploader_config";

export default function Command() {
    const {
        ctx,
        getActiveUploaderType,
        getActiveConfig,
        isAvailableConfig,
        syncConfig,
        uploaderTypeList,
        getConfigList,
    } = usePicGoContext();

    const { push } = useNavigation();
    const { uploadTimeout } = getPreferenceValues<ExtensionPreferences>();

    const {
        value: localConfig,
        isLoading,
        setValue: setLocalConfig,
    } = useLocalStorage<UserUploaderConfig>(UPLOADER_CONFIG_KEY);

    const [config, setConfig] = useState<UserUploaderConfig | undefined>(() => {
        if (localConfig && isAvailableConfig(localConfig)) return localConfig;
        else return { uploaderType: getActiveUploaderType(), configName: getActiveConfig()?._configName };
    });

    const dropdownItems = useMemo(() => {
        return <ConfigDropdownList uploaderTypes={uploaderTypeList} getConfigList={getConfigList} />;
    }, [uploaderTypeList]);

    let configName: string | undefined;

    try {
        configName = getActiveConfig()?._configName;
        if (config && isAvailableConfig(config)) syncConfig(config);
        else if (!configName) throw new Error("No available config");
        // early remove LocalStorage, and in next render, config state will fallback to first config and be synced to context
    } catch (e) {
        const err = e as Error;
        console.error(err);
        showToast(Toast.Style.Failure, err.message);
        return <ErrorView msg={err.message} />;
    }

    async function uploadImgs(input?: string[]) {
        const toast = await showToast(
            Toast.Style.Animated,
            "Uploading...",
            `${config!.uploaderType} [${config!.configName}]`,
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
        const { uploaderConfig, files } = data;
        const config = JSON.parse(uploaderConfig) as UserUploaderConfig;
        // config is available
        await setLocalConfig(config);
        syncConfig(config); // maybe redundant
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

    if (isLoading) {
        return <Form actions={null} isLoading={true} />;
    }

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
                id="uploaderConfig"
                title="Uploader Config"
                value={JSON.stringify(config)}
                onChange={(data) => {
                    const cfg = JSON.parse(data) as UserUploaderConfig;
                    setConfig(cfg);
                }}
            >
                {dropdownItems}
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
