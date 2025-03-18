export type RegistryAuthentication = {
    username: string;
    password: string;
} | {
    auth: string;
};

export type ConfigFileRegistryAuthentication = {
    configFilePath: string;
};
