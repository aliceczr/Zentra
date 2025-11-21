import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiProps {
  count?: number;
  duration?: number;
  colors?: string[];
}

interface ConfettiPiece {
  id: number;
  animatedValue: Animated.Value;
  color: string;
  size: number;
  initialX: number;
  rotation: Animated.Value;
}

export default function Confetti({ 
  count = 50, 
  duration = 3000,
  colors = ['#48C9B0', '#32BCAD', '#F39C12', '#E74C3C', '#9B59B6', '#3498DB']
}: ConfettiProps) {
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    // Criar peças de confetti
    confettiPieces.current = Array.from({ length: count }, (_, index) => ({
      id: index,
      animatedValue: new Animated.Value(0),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      initialX: Math.random() * width,
      rotation: new Animated.Value(0),
    }));

    // Animar todas as peças
    const animations = confettiPieces.current.map((piece) => {
      // Animação de queda
      const fallAnimation = Animated.timing(piece.animatedValue, {
        toValue: 1,
        duration: duration + Math.random() * 1000,
        useNativeDriver: true,
      });

      // Animação de rotação
      const rotationAnimation = Animated.loop(
        Animated.timing(piece.rotation, {
          toValue: 1,
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
        })
      );

      return Animated.parallel([fallAnimation, rotationAnimation]);
    });

    Animated.parallel(animations).start();

    return () => {
      confettiPieces.current.forEach(piece => {
        piece.animatedValue.stopAnimation();
        piece.rotation.stopAnimation();
      });
    };
  }, [count, duration, colors]);

  const renderConfettiPiece = (piece: ConfettiPiece) => {
    const translateY = piece.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, height + 50],
    });

    const translateX = piece.animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [piece.initialX, piece.initialX + (Math.random() - 0.5) * 100, piece.initialX + (Math.random() - 0.5) * 200],
    });

    const rotate = piece.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const opacity = piece.animatedValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    return (
      <Animated.View
        key={piece.id}
        style={[
          styles.confettiPiece,
          {
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            transform: [
              { translateX },
              { translateY },
              { rotate },
            ],
            opacity,
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map(renderConfettiPiece)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
});