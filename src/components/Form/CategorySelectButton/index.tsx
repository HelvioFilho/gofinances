import React from 'react';

import {
  Container,
  Category,
  Icon,
} from './styles';

interface DataCategory {
  title: string;
  onPress: () => void;
}

export function CategorySelectButton({ title, onPress }: DataCategory) {
  return (
    <Container
      onPress={onPress}
    >
      <Category>{title}</Category>
      <Icon name="chevron-down" />
    </Container>
  );
}