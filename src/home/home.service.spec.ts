import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 1,
    address: 'Rua teste',
    city: 'Curitiba',
    price: 1000000,
    propertyType: PropertyType.RESIDENTIAL,
    img: 'img1',
    number_of_bedrooms: 4,
    number_of_bathrooms: 4,
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

const mockHome = {
  id: 1,
  address: 'Rua teste',
  city: 'Curitiba',
  price: 1000000,
  propertyType: PropertyType.RESIDENTIAL,
  img: 'img1',
  numberOfBedrooms: 4,
  numberOfBathrooms: 4,
};

const mockImages = [
  {
    id: 1,
    url: 'src1',
  },
  {
    id: 2,
    url: 'src2',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Curitiba',
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prism home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: 'Rua teste de criacao',
      numberOfBedrooms: 4,
      numberOfBathrooms: 4,
      city: 'Ponta Grossa',
      landSize: 444,
      price: 2000000,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'src1',
        },
      ],
    };

    it('should call prisma home.create with correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: 'Rua teste de criacao',
          city: 'Ponta Grossa',
          land_size: 444,
          price: 2000000,
          propertyType: PropertyType.RESIDENTIAL,
          number_of_bedrooms: 4,
          number_of_bathrooms: 4,
          realtor_id: 5,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImages = jest.fn().mockReturnValue(mockImages);
      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImages);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateManyImages).toBeCalledWith({
        data: [
          {
            url: 'src1',
            home_id: 1,
          },
        ],
      });
    });
  });
});
