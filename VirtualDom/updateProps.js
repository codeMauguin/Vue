/**
 * 更新domProps属性
 * @param {HTMLElement} dom
 * @param {*} props
 */
export default function (dom, props) {
    const deleteProps = props?.deleteProps ;
    const updateProps = props?.updateProps;
    for (const key of Object.keys(deleteProps)) {
        switch (key) {
            case "class":
                {
                    dom.classList.remove(deleteProps[key]);
                }
                break;
            default: {
                dom.removeAttribute(key);
            }
        }
    }
    for (const key of Object.keys(updateProps)) {
        switch (true) {
            case /class/gi.test(key):
                {
                    dom.classList.add(updateProps[key]);
                }
                break;
            case /value/gi.test(key):
                {
                    if (dom.tagName === "INPUT") dom.value = updateProps[key];
                }
                break;
            default: {
                dom.setAttribute(key, updateProps[key]);
            }
        }
    }
}
