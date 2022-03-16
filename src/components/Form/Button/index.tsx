import React from 'react';
import { TouchableOpacityProps } from 'react-native';

import { Container, Title } from './styles';

interface DataButtonProps extends TouchableOpacityProps {
  title: string;
}

export function Button({ title, ...rest }: DataButtonProps) {
  return (
    <Container {...rest}>
      <Title>{title}</Title>
    </Container>
  );
}