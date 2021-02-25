const loaderUtils = require('loader-utils');

module.exports = {
    default: function (rawSource) {
        let {extractPathOnly, iconNameRegex, prefix} = {
            extractPathOnly: false,
            iconNameRegex: /\..*/g,
            prefix: 'custom',

            ...loaderUtils.getOptions(this)
        }


        let source = rawSource.replace(/\s/g, ' ').replace(/ {2,}/g, ''),

            pathFinder = /<path[\s\S]*?(?=d=")d="([\s\S]*?)"(?:(?:\/>)|(?:>[\s\S]*?<\/path>))/gi,
            path = pathFinder.exec(source),

            sizeFinder = /<svg[\s\S]*?(?=viewbox=")viewbox="(?:(\d*,? ?){1,4})"/gi,
            size = sizeFinder.exec(source);

        if (path === null) {
            throw new Error('No paths found in icon file.');
        }
        if (size === null) {
            throw new Error('No sizing (viewbox) found in icon file.');
        }
        paths = [path[1]];

        while((path = pathFinder.exec(source)) !== null) {
            paths.push(path[1])
        }

        if(extractPathOnly) {
            return `export default ${JSON.stringify(path)}`
        }

        let iconName = loaderUtils.interpolateName(this, '[name]', {}).replace(iconNameRegex, '');

        return `export default ${JSON.stringify({
            prefix,
            iconName,
            icon: [
                size[3] || size[1],
                size[4] || size[3] || size[2] || size[1],
                [],
                null,
                paths
            ]
        })}`
    }
}
