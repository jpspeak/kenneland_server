import { Model } from "mongoose";

type PaginatedResult = {
  data: [];
  totalDocs: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
};
// type Paginate = <T>(model: Model<T>, page: number, pageSize: number)=>T
const paginate: <T>(model: Model<T>, query: any, page?: number, pageSize?: number) => Promise<PaginatedResult> = async (model, query, page = 1, pageSize = 20) => {
  const skip = pageSize * (page - 1);

  const [studs, count] = await Promise.all([
    model
      .find(query)
      .skip(skip)
      .limit(pageSize),
    model.countDocuments()
  ]);

  const totalDocs = count;
  const totalPages = Math.ceil(count / pageSize);
  const nextPage = page + 1 <= totalPages ? page + 1 : null;
  const prevPage = page - 1 > 0 ? page - 1 : null;

  const result = {} as any;
  result.data = studs;
  result.totalDocs = totalDocs;
  result.totalPages = totalPages;
  result.nextPage = nextPage;
  result.prevPage = prevPage;

  return result;
};
export default paginate;
