import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (balanceAccumulator, transaction) => {
        if (transaction.type === 'income') {
          // eslint-disable-next-line no-param-reassign
          balanceAccumulator.income += Number(transaction.value);
        } else {
          // eslint-disable-next-line no-param-reassign
          balanceAccumulator.outcome += Number(transaction.value);
        }

        // eslint-disable-next-line no-param-reassign
        balanceAccumulator.total =
          balanceAccumulator.income - balanceAccumulator.outcome;

        return balanceAccumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
