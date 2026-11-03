import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-paginations.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return await this.prisma.order.create({ data: createOrderDto });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page = 1, limit = 10, status } = orderPaginationDto;

    const where = status ? { status } : {};

    const totalOrders = await this.prisma.order.count({ where });
    const lastPage = Math.ceil(totalOrders / limit);

    const data = await this.prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total: totalOrders,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    return order;
  }

  changeSOrderStatus() {}
}

