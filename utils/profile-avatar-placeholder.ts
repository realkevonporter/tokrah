import Images from "@/constants/images";

    export const profilePlaceholder = (gender:string | undefined) =>{
        switch (gender) {
            case 'MALE':
                return Images.avatar.male.portrait;

            case 'FEMALE':
                return Images.avatar.female.portrait;

            default:
                return Images.avatar.female.portrait;
        }
    };