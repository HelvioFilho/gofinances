import React from 'react';
import { TextInputProps } from 'react-native';

import { Container } from './styles';

interface DataInputProps extends TextInputProps { }

export function Input({ ...rest }: DataInputProps) {
  return (
    <Container
      {...rest}
    >

    </Container>
  );
}