import type {LayoutLoad} from "./$types";

export const load: LayoutLoad = async (req) => {
    const {url} = req;
    const {pathname} = url;

    return {
        pathname
    };
};