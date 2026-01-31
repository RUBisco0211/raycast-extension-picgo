import { useLocalStorage } from "@raycast/utils";
import { useEffect } from "react";
import { syncConfig } from "../util/context";
import { type UserUploaderConfig } from "../types/type";

export default function useUploaderConfig(initial: UserUploaderConfig) {
    const {
        value: uploaderConfig,
        isLoading,
        setValue: setUploaderConfig,
    } = useLocalStorage<UserUploaderConfig>("picgo:user_uploader_config", initial);

    useEffect(() => {
        if (!isLoading && uploaderConfig && uploaderConfig.type && uploaderConfig.configName) {
            const { type, configName } = uploaderConfig;
            syncConfig(type, configName);
        }
    }, [uploaderConfig, isLoading]);

    return {
        uploaderConfig,
        setUploaderConfig,
        isLoading,
    };
}
