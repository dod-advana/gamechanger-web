export const createCardGenerator = async (cloneMeta) => {
	console.log(
		'Creating ${cloneMeta.card_module} for clone ${cloneMeta.clone_name}'
	);
	const module = await import(
		'../modules/${cloneMeta.module_folder}/${cloneMeta.card_module}'
	);
	return module.generator;
};
