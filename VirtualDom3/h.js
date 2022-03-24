export function h({type, value}) {
    switch (type) {

        case "TEXT-NODE":
            return `_t_(${JSON.stringify(value)})`;
        case "ELEMENT":
            return `_v_(
          ${JSON.stringify(value.tagName)},
          ${JSON.stringify(value.attributes)},
        [ ${value.children?.map(h)} ],
        ${JSON.stringify(type)}
        )`;
        case "COMMENT":
            return `_c_(${JSON.stringify(value)})`;

        default:
            throw new SyntaxError(`unsupported type：${type}`);
    }
}
