import type { Diary } from '../mod.ts';

import { delay } from '@std/async';
import { faker } from 'npm:@faker-js/faker';

export async function log_journey(log: Diary) {
	type Order = any;

	let db = {
		orders: [] as Order[],
		prices: {
			Latte: 4.0,
			Cappuccino: 3.5,
			Espresso: 2.5,
			Americano: 3.0,
			Mocha: 4.5,
		},
	};

	async function save_order(order: Order) {
		await delay(faker.number.int({ min: 500, max: 1000 }));
		db.orders.push(order);
		log('info', 'Order {id} saved to database', order);
	}

	async function update_order(order: Order) {
		await delay(faker.number.int({ min: 500, max: 1000 }));
		const index = db.orders.findIndex((o) => o.id === order.id);
		if (index !== -1) {
			db.orders[index] = order;
			log('info', 'Order {id} updated in database', order);
		}
	}

	async function process(order: Order) {
		order.status = 'in progress';
		log('debug', 'Order {id} is being prepared', order);
		await delay(faker.number.int({ min: 1000, max: 3000 }));
		order.status = 'completed';
		log('info', 'Order {id} is completed for {customer}', order);
	}

	function gen_order(): Order {
		const drink: keyof typeof db.prices = faker.helpers.arrayElement([
			'Latte',
			'Cappuccino',
			'Espresso',
			'Americano',
			'Mocha',
		]);

		const order = {
			id: faker.string.uuid(),
			customer: faker.person.firstName(),
			drink,
			size: faker.helpers.arrayElement(['Small', 'Medium', 'Large']),
			price: db.prices[drink],
			status: 'new',
		};
		log('info', 'New order received: {id}, {customer}, {drink}, {size} ${price}', order);
		return order;
	}

	while (true) {
		const newOrder = gen_order();
		await save_order(newOrder);
		await process(newOrder);
		await update_order(newOrder);
		await delay(faker.number.int({ min: 500, max: 1500 }));
	}
}
