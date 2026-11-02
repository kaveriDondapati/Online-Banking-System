package com.Bank.Online.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads Online/.env into system properties before Spring starts.
 * Existing OS / Render environment variables are never overwritten.
 */
public final class LocalEnvLoader {

    private LocalEnvLoader() {
    }

    public static void load() {
        for (Path file : candidateFiles()) {
            if (Files.isRegularFile(file)) {
                applyFile(file);
                return;
            }
        }
    }

    private static List<Path> candidateFiles() {
        List<Path> files = new ArrayList<>();
        files.add(Path.of(".env"));
        files.add(Path.of("Online", ".env"));
        String userDir = System.getProperty("user.dir");
        if (userDir != null && !userDir.isBlank()) {
            Path dir = Path.of(userDir);
            files.add(dir.resolve(".env"));
            files.add(dir.resolve("Online").resolve(".env"));
            Path parent = dir.getParent();
            if (parent != null) {
                files.add(parent.resolve(".env"));
                files.add(parent.resolve("Online").resolve(".env"));
            }
        }
        return files;
    }

    private static void applyFile(Path file) {
        try {
            for (String raw : Files.readAllLines(file)) {
                String line = raw.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int split = line.indexOf('=');
                String key = line.substring(0, split).trim();
                String value = line.substring(split + 1).trim();
                if (value.length() >= 2) {
                    char first = value.charAt(0);
                    char last = value.charAt(value.length() - 1);
                    if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                        value = value.substring(1, value.length() - 1);
                    }
                }
                if (System.getenv(key) == null && System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException ignored) {
            // Fall through to environment variables (Render).
        }
    }
}
