export interface FileNode {
    type: 'file' | 'directory';
    content?: string;
    permissions?: string;
    owner?: string;
    children?: { [key: string]: FileNode };
}

export const resolvePath = (currentPath: string, targetPath: string): string => {
    if (targetPath.startsWith('/')) return targetPath;

    const parts = currentPath.split('/').filter(Boolean);
    const newParts = targetPath.split('/').filter(Boolean);

    for (const part of newParts) {
        if (part === '..') {
            parts.pop();
        } else if (part !== '.') {
            parts.push(part);
        }
    }

    return '/' + parts.join('/');
};

export const getNode = (root: FileNode, path: string): FileNode | null => {
    const parts = path.split('/').filter(Boolean);
    let node: FileNode = root;

    for (const part of parts) {
        if (node.type !== 'directory' || !node.children || !node.children[part]) {
            return null;
        }
        node = node.children[part];
    }

    return node;
};

export const parseChmod = (arg: string, currentPerms: string): string => {
    if (arg.startsWith('+') || arg.startsWith('-')) {
        const add = arg.startsWith('+');
        const perm = arg.slice(1);
        const permsArray = currentPerms.split('');

        if (perm === 'r') {
            permsArray[0] = add ? 'r' : '-';
            permsArray[3] = add ? 'r' : '-';
            permsArray[6] = add ? 'r' : '-';
        } else if (perm === 'w') {
            permsArray[1] = add ? 'w' : '-';
        } else if (perm === 'x') {
            permsArray[2] = add ? 'x' : '-';
            permsArray[5] = add ? 'x' : '-';
            permsArray[8] = add ? 'x' : '-';
        }
        return permsArray.join('');
    }

    if (/^[0-7]{3}$/.test(arg)) {
        const octalToPerms = (n: number): string => {
            return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
        };
        return octalToPerms(parseInt(arg[0])) +
            octalToPerms(parseInt(arg[1])) +
            octalToPerms(parseInt(arg[2]));
    }

    return currentPerms;
};

export const updateVFS = (root: FileNode, path: string, updateFn: (node: FileNode) => FileNode): FileNode => {
    const parts = path.split('/').filter(Boolean);

    const recurse = (node: FileNode, pathParts: string[]): FileNode => {
        if (pathParts.length === 0) {
            return updateFn(node);
        }

        const [current, ...rest] = pathParts;
        const children = node.children || {};
        const child = children[current] || { type: 'file', permissions: 'rw-r--r--', owner: 'guest', content: '' };

        return {
            ...node,
            type: 'directory',
            children: {
                ...children,
                [current]: recurse(child, rest)
            }
        };
    };

    return recurse(root, parts);
};
