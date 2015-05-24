package com.emc.greenplum.hadoop.plugin;

import com.emc.greenplum.hadoop.HdfsVersion;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class HdfsCachedPluginBuilder extends HdfsPluginBuilder {
    private Map<HdfsVersion, HdfsPluginLoader> pluginCache = new ConcurrentHashMap<HdfsVersion, HdfsPluginLoader>();
    private HdfsPluginBuilder builder;

    public HdfsCachedPluginBuilder(HdfsPluginBuilder builder) {
        this.builder = builder;
    }

    public HdfsPluginLoader build(HdfsVersion version) {
        if(pluginCache.containsKey(version)) {
            return pluginCache.get(version);
        } else {
            return loadPluginFromScratch(version);
        }
    }

    private HdfsPluginLoader loadPluginFromScratch(HdfsVersion version) {
        HdfsPluginLoader pluginLoader = builder.build(version);
        pluginCache.put(version, pluginLoader);

        return pluginLoader;
    }
}
