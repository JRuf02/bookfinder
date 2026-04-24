from dataclasses import is_dataclass

from camel_converter import dict_to_camel


def as_json_dict(
    obj: object,
) -> object:
    """Convert objects to dict with camelCase keys for the frontend.

    Dataclasses with a field named "value" will be replaced by that value.
    """

    if isinstance(obj, tuple):
        return tuple(as_json_dict(item) for item in obj)

    if isinstance(obj, list):
        return [as_json_dict(item) for item in obj]

    if isinstance(obj, set):
        return {as_json_dict(item) for item in obj}

    if is_dataclass(obj):
        data = vars(obj)

        if "value" in data and isinstance(data["value"], (str, int)):
            data = data["value"]

    else:
        data = obj

    if isinstance(data, dict):
        for key, value in data.items():
            if (
                isinstance(value, dict)
                or is_dataclass(value)
                or isinstance(value, list)
            ):
                data[key] = as_json_dict(value)

        data = dict_to_camel(data)

    return data
