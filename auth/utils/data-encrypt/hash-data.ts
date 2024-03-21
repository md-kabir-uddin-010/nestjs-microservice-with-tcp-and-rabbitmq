import { hash } from 'bcrypt';

const hash_data = async (data: string): Promise<string> => {
  try {
    return await hash(data, 10);
  } catch (error) {
    throw error;
  }
};

export default hash_data;
