import React from 'react';

import {
  Container,
  Category,
  Icon,
} from './styles';

interface DataCategory {
  title: string;
}

export function CategorySelect({ title }: DataCategory) {
  return (
    <Container>
      <Category>{title}</Category>
      <Icon name="chevron-down" />
    </Container>
  );
}