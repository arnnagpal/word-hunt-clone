export function isJsonString(str: string) {
    try {
        var json = JSON.parse(str);
        return typeof json === "object";
    } catch (e) {
        return false;
    }
}
