import { PaginationDTO } from './pagination.dto';

export class FindAllResultDto<T> {
  data: T[];
  pagination: PaginationDTO;
}
