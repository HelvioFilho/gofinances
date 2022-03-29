import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { SvgProps } from 'react-native-svg';

import {
  Button,
  ImageContainer,
  Text,
} from './styles';

interface SignInProps extends TouchableOpacityProps {
  title: string;
  svg: React.FC<SvgProps>;
}

export function SingInSocialButton({ title, svg: Svg, ...rest }: SignInProps) {
  return (
    <Button
      activeOpacity={0.8}
      {...rest}
    >
      <ImageContainer>
        <Svg />
      </ImageContainer>
      <Text>
        {title}
      </Text>
    </Button>
  );
} 