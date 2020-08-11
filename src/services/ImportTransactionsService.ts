import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, getCustomRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const csvCategories: string[] = [];
    const transactions: CSVTransaction[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      csvCategories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // insere apenas as categorias vindas do csv que ainda não existem na
    // base de dados num bulk insert

    const categoriesRepository = getRepository(Category);

    const csvCategoryCandidateTitlesToInsert = Array.from(
      new Set(csvCategories),
    );

    const existentCategoriesInDB = await categoriesRepository.find({
      where: {
        title: In(csvCategoryCandidateTitlesToInsert),
      },
    });
    const existentCategoryTitlesInDB = existentCategoriesInDB.map(
      category => category.title,
    );

    const newCategoryTitlesToInsert = csvCategoryCandidateTitlesToInsert.filter(
      csvCategoryCandidateTitle =>
        !existentCategoryTitlesInDB.includes(csvCategoryCandidateTitle),
    );

    const newCategories = categoriesRepository.create(
      newCategoryTitlesToInsert.map(title => ({ title })),
    );

    const insertedCategories = await categoriesRepository.save(newCategories);

    const allCategories = [...existentCategoriesInDB, ...insertedCategories];

    // insere as transações vindas do csv num bulk insert

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const newTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    const insertedTransactions = await transactionsRepository.save(
      newTransactions,
    );

    await fs.promises.unlink(filePath);

    return insertedTransactions;
  }
}

export default ImportTransactionsService;
