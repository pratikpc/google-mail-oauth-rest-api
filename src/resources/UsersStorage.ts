import { existsSync } from 'fs';
import { lstat, readFile, writeFile } from 'fs/promises';
import path, { join } from 'path';

import User from '../interfaces/User';

// Store the User Meta Data in a File as Recommended

class UsersStorage {
    public FilePath = '.';
    public DefaultFile = 'api.json';
    public Info: { [key in string]: User } = {};

    public async LoadFile() {
        // Find absolute path to file
        this.FilePath = path.resolve(this.FilePath);
        // Check for File Existence
        if (!this.Exists) {
            return;
        }
        // First Check if Path is Folder
        const stats = await lstat(this.FilePath);
        if (stats.isDirectory())
            // If it's Folder
            // Link Up with Default Selected File
            this.FilePath = join(
                this.FilePath,
                this.DefaultFile
            );

        // If the File Exists, Read the File
        if (this.Exists) this.Info = await this.Read;
    }

    public SetUser(email: string, user: User) {
        this.Info[email] = user;
    }

    public RemoveUser(email: string) {
        delete this.Info[email];
    }

    private get Read() {
        return readFile(this.FilePath)
            .then((buffer) => buffer.toString())
            .then((text) => {
                try {
                    const json = JSON.parse(text);
                    return json;
                } catch (err) {
                    return {};
                }
            });
    }

    private get Exists() {
        return (
            this.FilePath !== '' &&
            existsSync(this.FilePath)
        );
    }

    public get Save() {
        return writeFile(
            this.FilePath,
            JSON.stringify(this.Info, null, '\t')
        );
    }
}

const UserStorage = new UsersStorage();
export default UserStorage;
