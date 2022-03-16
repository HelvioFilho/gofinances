import styled, { css } from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface IconProps {
  type: 'up' | 'down';
}

interface ContainerProps extends IconProps {
  isActive: boolean;
}

export const Container = styled(TouchableOpacity) <ContainerProps>`
  width: 48%;
  flex-direction: row;
  align-items: center;
  border-width: ${({ isActive }) => isActive ? 0 : 1.5}px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.text};
  border-radius: 5px;
  padding: 16px;
  justify-content: center;

  ${({ isActive, type }) => isActive && type === 'up' && css`
    background-color: ${({ theme }) => theme.colors.success_light};
  `}
  ${({ isActive, type }) => isActive && type === 'down' && css`
    background-color: ${({ theme }) => theme.colors.danger_light};
  `}
`;

export const Icon = styled(Feather) <IconProps>`
  font-size:${RFValue(24)}px;
  margin-right: 12px;
  color: ${({ theme, type }) => type === 'up' ? theme.colors.success : theme.colors.danger};

`;
export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size:${RFValue(14)}px;
`;