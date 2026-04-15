// api/crudFactory.ts
import { z } from 'zod';
import { pb } from '@/lib/pocketbase';
import type { RecordFullListOptions, RecordModel, RecordOptions } from 'pocketbase';

type CrudFactoryConfig<TOutput, TCreateInput, TUpdateInput> = {
  collection: string;

  outputSchema: z.ZodType<TOutput>;
  createSchema: z.ZodType<TCreateInput>;
  updateSchema: z.ZodType<TUpdateInput>;
};

export function createCrudApi<TOutput, TCreateInput, TUpdateInput>(
  config: CrudFactoryConfig<TOutput, TCreateInput, TUpdateInput>
) {
  const { collection, outputSchema, createSchema, updateSchema } = config;

  return {
    // 🔍 Get list
    getList: async (options?: RecordFullListOptions): Promise<TOutput[]> => {
      const data = await pb.collection(collection).getFullList(options);
      return data as TOutput[];
    },

    // 🔍 Get one
    getOne: async (id: string, options?: RecordOptions): Promise<TOutput> => {
      const data = await pb.collection(collection).getOne(id, options);
      return data as TOutput;
    },

    // ➕ Create
    create: async (input: z.infer<typeof createSchema>): Promise<TOutput> => {
      const parsed = createSchema.parse(input);
      const data = await pb.collection(collection).create(parsed as RecordModel);
      return data as TOutput;
    },

    // ✏️ Update
    update: async (id: string, input: z.infer<typeof updateSchema>): Promise<TOutput> => {
      const parsed = updateSchema.parse(input);
      const data = await pb.collection(collection).update(id, parsed as RecordModel);
      return data as TOutput;
    },

    // ❌ Delete
    delete: async (id: string): Promise<void> => {
      await pb.collection(collection).delete(id);
    },
  };
}
