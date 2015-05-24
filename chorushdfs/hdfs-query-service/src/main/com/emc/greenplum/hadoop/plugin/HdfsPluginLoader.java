package com.emc.greenplum.hadoop.plugin;

import com.emc.greenplum.hadoop.HdfsVersion;
import com.emc.greenplum.hadoop.plugins.HdfsFileSystem;
import org.xeustechnologies.jcl.JarClassLoader;
import org.xeustechnologies.jcl.JclObjectFactory;
import org.xeustechnologies.jcl.JclUtils;

public class HdfsPluginLoader {
    private HdfsVersion version;
    private JarClassLoader classLoader;

    public HdfsPluginLoader(HdfsVersion version) {
        this.version = version;
        initializeClassLoader();
    }

    private void initializeClassLoader() {
        classLoader = new JarClassLoader();
        classLoader.add(this.getClass().getClassLoader().getResource(version.getPluginJar()));

        for (String dependency : version.getDependencies()) {
            classLoader.add(this.getClass().getClassLoader().getResource(dependency));
        }
    }

    public HdfsFileSystem loadObjectFromPlugin() {
        JclObjectFactory objectFactory = JclObjectFactory.getInstance();
        Object hdfsObject = objectFactory.create(classLoader, "com.emc.greenplum.hadoop.plugins.HdfsFileSystemImpl");

        HdfsFileSystem fileSystem = (HdfsFileSystem) JclUtils.toCastable(hdfsObject, HdfsFileSystem.class);
        fileSystem.setClassLoader(classLoader);

        return fileSystem;
    }
}