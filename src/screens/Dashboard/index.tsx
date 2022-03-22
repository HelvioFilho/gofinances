import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { HighlightCard } from '../../components/HighlightCard';
import { useFocusEffect } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TransactionCard, TransactionCardDataProps } from '../../components/TransactionCard';
import {
  Container,
  Header,
  Icon,
  Photo,
  User,
  UserGreeting,
  UserInfo,
  UserName,
  UserWrapper,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LoadContainer
} from './styles';
import { useTheme } from 'styled-components';
export interface TransactionProps extends TransactionCardDataProps {
  id: string;
}

interface HighLightProps {
  amount: string;
}

interface HighlightData {
  entries: HighLightProps,
  expenses: HighLightProps,
  total: HighLightProps
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  const theme = useTheme();

  async function loadTransactions() {
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];
    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: TransactionProps[] = transactions.map(
      (item: TransactionProps) => {

        item.type === 'up' ? entriesTotal += Number(item.amount) : expensiveTotal += Number(item.amount);

        const amount = Number(item.amount)
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        }
      }
    );
    setTransactions(transactionsFormatted);

    const lastTransactionEntries = transactions;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      },
      expenses: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      },
      total: {
        amount: (entriesTotal - expensiveTotal).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      },
    });
    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();

  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []));

  return (
    <Container>

      {
        isLoading
          ?
          <LoadContainer>
            <ActivityIndicator
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer>
          :
          <>
            <Header>
              <UserWrapper>
                <UserInfo>
                  <Photo source={{ uri: "https://avatars.githubusercontent.com/u/14864367?v=4" }} />
                  <User>
                    <UserGreeting>Olá, </UserGreeting>
                    <UserName>Hélvio </UserName>
                  </User>
                </UserInfo>
                <Icon name="power" />
              </UserWrapper>
            </Header>
            <HighlightCards>
              <HighlightCard
                type="up"
                title="Entradas"
                amount={highlightData.entries.amount}
                lastTransaction="Última entrada dia 13 de abril"
              />
              <HighlightCard
                type="down"
                title="Saídas"
                amount={highlightData.expenses.amount}
                lastTransaction="Última saída dia 03 de abril"
              />
              <HighlightCard
                type="total"
                title="Total"

                amount={highlightData.total.amount}
                lastTransaction="01 à 16 de abril"
              />
            </HighlightCards>
            <Transactions>
              <Title>
                Listagem
              </Title>
              <TransactionList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={({ item }) =>
                  <TransactionCard data={item} />
                }
              />
            </Transactions>
          </>
      }
    </Container>
  );
}