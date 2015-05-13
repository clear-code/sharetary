function toPropertyDescriptors(aProperties) {
	var descriptors = {};
	Object.keys(aProperties).forEach(function(aProperty) {
		var description = Object.getOwnPropertyDescriptor(aProperties, aProperty);
		descriptors[aProperty] = description;
	});
	return descriptors;
}

function inherit(aParent, aExtraProperties) {
	if (aExtraProperties)
		return Object.create(aParent, toPropertyDescriptors(aExtraProperties));
	else
		return Object.create(aParent);
}

module.exports = inherit;
