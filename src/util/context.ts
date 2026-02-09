import { PicGo, IUploaderConfigItem } from "picgo";
import { UserUploaderConfig } from "../types/type";
import { useRef } from "react";

export default function () {
    const ctxRef = useRef<PicGo | null>(null);
    if (!ctxRef.current) ctxRef.current = new PicGo();
    const ctx = ctxRef.current;

    const getActiveUploaderType = () => ctx.getConfig<string>("picBed.uploader");
    const getUploaderTypeList = () => ctx.uploaderConfig.listUploaderTypes();

    function getConfigList(type?: string) {
        if (!type) type = getActiveUploaderType();
        if (!getUploaderTypeList().find((t) => t === type)) throw new Error(`Uploader type '${type}' not found`);
        return ctx.uploaderConfig.getConfigList(type);
    }

    function getActiveConfig(type?: string) {
        if (!type) type = getActiveUploaderType();
        if (!getUploaderTypeList().find((t) => t === type)) throw new Error(`Uploader type '${type}' not found`);
        return ctx.uploaderConfig.getActiveConfig(type);
    }

    function isAvailableConfig(config: UserUploaderConfig) {
        const { uploaderType: type, configId } = config;
        if (!configId) return false;
        if (!getUploaderTypeList().find((t) => t === type)) return false;
        if (!getConfigList(type).find((cfg) => cfg._id === configId)) return false;
        return true;
    }

    function syncConfig(config: UserUploaderConfig) {
        const { uploaderType: type, configId } = config;
        if (!configId) throw new Error("ConfigName undefined");
        if (!getUploaderTypeList().find((t) => t === type)) throw new Error(`Uploader type '${type}' not found`);
        const cfg = getConfigList(type).find((c) => c._id === configId)!;
        if (!cfg) throw new Error(`Config Id '${configId}' not found for uploader type '${type}'`);
        // ctx.setConfig({
        //     "picBed.uploader": type,
        //     "picBed.current": type,
        //     [`picBed.${type}`]: cfg,
        //     [`uploader.${type}.defaultId`]: cfg._id,
        // });
        ctx.uploaderConfig.use(type, cfg._configName);
    }

    function getUploaderConfigItemDetails(type: string, configName: string) {
        return ctx.helper.uploader.get(type)?.config!(ctx);
    }

    const copyConfig = (type: string, oldName: string, newName: string) => {
        ctx.uploaderConfig.copy(type, oldName, newName);
    };
    const removeConfig = (type: string, configName: string) => ctx.uploaderConfig.remove(type, configName);
    const renameConfig = ctx.uploaderConfig.rename;
    const createOrUpdateConfig = (type: string, config: IUploaderConfigItem) => {
        return ctx.uploaderConfig.createOrUpdate(type, config._configName, config);
    };

    return {
        ctx: ctx,
        getUploaderTypeList,

        getActiveUploaderType,
        getConfigList,
        getActiveConfig,

        isAvailableConfig,
        syncConfig,

        getUploaderConfigItemDetails,

        createOrUpdateConfig,
        copyConfig,
        removeConfig,
        renameConfig,
    };
}
