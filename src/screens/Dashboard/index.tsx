import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { HighlightCard } from '../../components/HighlightCard';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

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
  LoadContainer,
  LogoutButton
} from './styles';

export interface TransactionProps extends TransactionCardDataProps {
  id: string;
}

interface HighLightProps {
  amount: string;
  lastTransaction: string;
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
  const { signOut } = useAuth();

  function getLastTransitionDate(
    collection: TransactionProps[],
    type: 'up' | 'down'
  ) {
    const lastTransaction = new Date(
      Math.max.apply(Math, collection
        .filter(transaction => transaction.type === type)
        .map(transaction => new Date(transaction.date).getTime())
      )
    );
    return Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
    }).format(lastTransaction);
  }

  async function loadTransactions() {
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];
    let entriesTotal = 0;
    let expensesTotal = 0;

    const transactionsFormatted: TransactionProps[] = transactions.map(
      (item: TransactionProps) => {

        item.type === 'up' ? entriesTotal += Number(item.amount) : expensesTotal += Number(item.amount);

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

    const lastTransactionEntries = entriesTotal > 0 ? getLastTransitionDate(transactions, 'up') : 0;
    const lastTransactionExpenses = expensesTotal > 0 ? getLastTransitionDate(transactions, 'down') : 0;
    const totalInterval = lastTransactionEntries === 0 ? 'ainda não houve entrada de saldo' : `01 a ${lastTransactionEntries}`;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastTransactionEntries === 0 ? ' - ' : `Última entrada dia ${lastTransactionEntries}`,
      },
      expenses: {
        amount: expensesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastTransactionExpenses === 0 ? ' - ' : `Última saída dia ${lastTransactionExpenses}`,
      },
      total: {
        amount: (entriesTotal - expensesTotal).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: totalInterval,
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
                <LogoutButton
                  onPress={signOut}
                  activeOpacity={0.8}
                >
                  <Icon name="power" />
                </LogoutButton>
              </UserWrapper>
            </Header>
            <HighlightCards>
              <HighlightCard
                type="up"
                title="Entradas"
                amount={highlightData.entries.amount}
                lastTransaction={highlightData.entries.lastTransaction}
              />
              <HighlightCard
                type="down"
                title="Saídas"
                amount={highlightData.expenses.amount}
                lastTransaction={highlightData.expenses.lastTransaction}
              />
              <HighlightCard
                type="total"
                title="Total"

                amount={highlightData.total.amount}
                lastTransaction={highlightData.total.lastTransaction}
              />
            </HighlightCards>
            <Transactions>
              <Title>
                Listagem
              </Title>
              {
                transactions.length > 0
                  ?
                  <TransactionList
                    data={transactions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) =>
                      <TransactionCard data={item} />
                    }
                  />
                  :
                  <Text>
                    Nenhum item cadastrado no momento!
                  </Text>
              }
            </Transactions>
          </>
      }
    </Container>
  );
}