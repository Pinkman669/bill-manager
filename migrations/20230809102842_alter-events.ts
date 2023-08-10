import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('events', (table) => {
        table.string('msg')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('events', (table) => {
        table.dropColumn('msg')
    })
}

