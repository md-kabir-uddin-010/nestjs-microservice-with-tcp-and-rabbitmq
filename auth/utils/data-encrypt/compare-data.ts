import { compare } from 'bcrypt';

const compare_data = async (
  hashed_data: string,
  plain_data: string,
): Promise<boolean> => {
  try {
    return await compare(hashed_data, plain_data);
  } catch (error) {
    throw error;
  }
};

export default compare_data;
