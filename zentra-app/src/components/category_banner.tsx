import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ImageSourcePropType } from 'react-native';
import { styles } from './style.styles';

// Tipo para os itens do banner de categoria
export interface CategoryItem {
  id: string;
  name: string;
  image: ImageSourcePropType | string;
  onPress?: () => void;
}

// Componente do item individual da categoria
export const CategoryCard = ({ item }: { item: CategoryItem }) => {
  const imageSource = typeof item.image === 'string' 
    ? { uri: item.image } 
    : item.image;

  return (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.categoryImageContainer}>
        <Image 
          source={imageSource}
          style={styles.categoryImage}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );
};

// Componente principal do banner de categorias
export const CategoryBanner = ({ 
  title, 
  items, 
  showTitle = true 
}: { 
  title?: string; 
  items: CategoryItem[]; 
  showTitle?: boolean;
}) => {
  return (
    <View style={styles.categoryBannerContainer}>
      {showTitle && title && (
        <Text style={styles.categoryBannerTitle}>{title}</Text>
      )}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContainer}
        style={styles.categoryScrollView}
      >
        {items.map((item) => (
          <CategoryCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};