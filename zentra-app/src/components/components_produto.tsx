import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ImageSourcePropType } from 'react-native';
import { styles } from './style.styles';

// Tipo para os dados do produto
export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: ImageSourcePropType | string;
  description?: string;
}

// Componente do card individual do produto
export const ProductCard = ({ product, onPress }: { 
  product: Product; 
  onPress?: (product: Product) => void; 
}) => {
  const imageSource = typeof product.image === 'string' 
    ? { uri: product.image } 
    : product.image;

  return (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => onPress?.(product)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={imageSource}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>
          {product.currency}{product.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Componente do grid de produtos
export const ProductGrid = ({ 
  products, 
  onProductPress,
  numColumns = 3 
}: { 
  products: Product[]; 
  onProductPress?: (product: Product) => void;
  numColumns?: number;
}) => {
  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard 
      product={item} 
      onPress={onProductPress}
    />
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.productGrid}
      columnWrapperStyle={numColumns > 1 ? styles.productRow : undefined}
      showsVerticalScrollIndicator={false}
    />
  );
};