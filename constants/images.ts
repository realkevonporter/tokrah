import { ImageSourcePropType } from 'react-native';

/**
 * Centralized image references for the app.
 * Place your files under: apps/REDNIT/rednit/assets/images/...
 *
 * Usage:
 * import { Images, getImage } from 'path/to/constants/images';
 * <Image source={Images.logo} />
 * <Image source={getImage('icons.upvote')} />
 */

export const Images = {
    // top-level images
    // logo: require('../assets/images/logo.png') as ImageSourcePropType,
    avatar:{
        male:{
            portrait:require('../assets/images/placeholders/male-avatar.jpg') as ImageSourcePropType
        },
        female:{
            portrait:require('../assets/images/placeholders/female-avatar.jpg') as ImageSourcePropType
        }
    } 

    // background: require('../assets/images/background.jpg') as ImageSourcePropType,
    // postPlaceholder: require('../assets/images/post_placeholder.png') as ImageSourcePropType,

    // // grouped icon set
    // icons: {
    //     upvote: require('../assets/images/icons/upvote.png') as ImageSourcePropType,
    //     downvote: require('../assets/images/icons/downvote.png') as ImageSourcePropType,
    //     comment: require('../assets/images/icons/comment.png') as ImageSourcePropType,
    //     share: require('../assets/images/icons/share.png') as ImageSourcePropType,
    //     menu: require('../assets/images/icons/menu.png') as ImageSourcePropType,
    // },
} as const;

/**
 * Safe accessor for nested image keys using dot notation.
 * Example: getImage('icons.upvote') -> ImageSourcePropType | undefined
 */
export function getImage(keyPath: string): ImageSourcePropType | undefined {
    const parts = keyPath.split('.');
    let current: any = Images;
    for (const part of parts) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[part];
    }
    return current as ImageSourcePropType | undefined;
}

export default Images;