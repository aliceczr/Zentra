import { View, Text, ImageBackground, ImageSourcePropType } from 'react-native';
import { styles } from './../components/style.styles';

export const Banner = ({ image, message }: { image: string | ImageSourcePropType; message: string }) => {
    // Determina se é uma URL (string) ou imagem local (require)
    const imageSource = typeof image === 'string' 
        ? { uri: image } 
        : image;

    return(
        <View style={styles.banner}>
            <ImageBackground 
                source={imageSource} 
                style={styles.banner_image}
                resizeMode="cover"
            >
                <Text style={styles.banner_text}>{message}</Text>
            </ImageBackground>
        </View>
    )
};
