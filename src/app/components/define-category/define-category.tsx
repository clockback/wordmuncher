import { Dispatch, JSX, SetStateAction, useState } from "react";

import styles from "./define-category.module.css";
import {
    CategoryInterface,
    FeatureInterface,
} from "src/app/vocab/inflections/helpers/interfaces";

interface AddCategoryProps {
    category: CategoryInterface;
    setCategory: Dispatch<SetStateAction<CategoryInterface>>;
    features: FeatureInterface[];
    setFeatures: Dispatch<SetStateAction<FeatureInterface[]>>;
    isPending: boolean;
}

function featuresIncludeName(features: FeatureInterface[], name: string) {
    for (const feature of features) {
        if (feature.name === name) {
            return true;
        }
    }
    return false;
}

function getIndexOfFeatureById(
    features: FeatureInterface[],
    id: number,
): number {
    for (let featureI = 0; featureI < features.length; featureI++) {
        if (features[featureI].id === id) {
            return featureI;
        }
    }

    throw new Error(`Feature with ID ${id} not found in list.`);
}

export default function DefineCategory({
    category,
    setCategory,
    features,
    setFeatures,
    isPending,
}: AddCategoryProps) {
    const [isAddingFeature, setIsAddingFeature] = useState<boolean>(false);
    const [isModifyingFeature, setIsModifyingFeature] =
        useState<boolean>(false);
    const [editingText, setEditingText] = useState<string>("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const onChangeEditingText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingText(e.target.value);
    };

    const onBlurModifyFeatureInput = () => {
        setIsModifyingFeature(false);
        const trimEditingText = editingText.trim();
        if (
            trimEditingText.length === 0 ||
            featuresIncludeName(features, trimEditingText)
        ) {
            return;
        }
        const copyFeatures = [].concat(features);
        copyFeatures[getIndexOfFeatureById(features, selectedId)] = {
            name: editingText,
            id: selectedId,
        };
        setFeatures(copyFeatures);
    };

    const rows = [];
    for (const feature of features) {
        const className = feature.id === selectedId ? styles.selected : null;
        const onClickFeature = () => {
            if (!isModifyingFeature && selectedId === feature.id) {
                setIsModifyingFeature(true);
                setEditingText(feature.name);
            } else {
                setSelectedId(feature.id);
            }
        };
        let cellContents: JSX.Element | string;
        if (isModifyingFeature && selectedId === feature.id) {
            cellContents = (
                <input
                    className={styles.featureinput}
                    autoFocus
                    onBlur={onBlurModifyFeatureInput}
                    onKeyDown={modifyFeaturePreventFormSubmission}
                    value={editingText}
                    onChange={onChangeEditingText}
                    disabled={isPending}
                ></input>
            );
        } else {
            cellContents = feature.name;
        }
        rows.push(
            <tr key={feature.id}>
                <td colSpan={4} onClick={onClickFeature} className={className}>
                    {cellContents}
                </td>
            </tr>,
        );
    }

    function categoryPreventFormSubmission(
        e: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (e.code == "Enter") {
            e.preventDefault();
        }
    }

    function modifyFeaturePreventFormSubmission(
        e: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (e.code == "Enter") {
            e.preventDefault();
            onBlurModifyFeatureInput();
        }
    }

    function addFeaturePreventFormSubmission(
        e: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (e.code == "Enter") {
            e.preventDefault();
            onBlurAddFeatureInput();
        }
    }

    const onChangeCategoryName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategory({ name: e.target.value, id: category.id });
    };

    const onBlurAddFeatureInput = () => {
        setIsAddingFeature(false);
        const trimEditingText = editingText.trim();
        if (
            trimEditingText.length === 0 ||
            featuresIncludeName(features, trimEditingText)
        ) {
            return;
        }
        const copyFeatures: FeatureInterface[] = [].concat(features);
        copyFeatures.push({ name: editingText, id: -(features.length + 1) });
        setSelectedId(features.length);
        setFeatures(copyFeatures);
    };

    if (isAddingFeature) {
        rows.push(
            <tr key={-(features.length + 1)}>
                <td colSpan={4}>
                    <input
                        className={styles.featureinput}
                        autoFocus
                        onBlur={onBlurAddFeatureInput}
                        onKeyDown={addFeaturePreventFormSubmission}
                        value={editingText}
                        onChange={onChangeEditingText}
                        disabled={isPending}
                    ></input>
                </td>
            </tr>,
        );
    } else {
        const addFeature = isPending
            ? null
            : () => {
                  setSelectedId(null);
                  setEditingText("");
                  setIsAddingFeature(true);
              };

        const removeFeature =
            selectedId === null || isPending
                ? null
                : () => {
                      const copyFeatures: FeatureInterface[] = [].concat(
                          features,
                      );
                      copyFeatures.splice(
                          getIndexOfFeatureById(features, selectedId),
                          1,
                      );
                      setFeatures(copyFeatures);
                      setSelectedId(null);
                  };

        const moveFeatureUp =
            selectedId === null || selectedId === features.at(0).id || isPending
                ? null
                : () => {
                      const copyFeatures: FeatureInterface[] = [].concat(
                          features,
                      );
                      const featureIndex = getIndexOfFeatureById(
                          features,
                          selectedId,
                      );
                      const [feature] = copyFeatures.splice(featureIndex, 1);
                      copyFeatures.splice(featureIndex - 1, 0, feature);
                      setFeatures(copyFeatures);
                  };

        const moveFeatureDown =
            selectedId === null ||
            selectedId === features.at(-1).id ||
            isPending
                ? null
                : () => {
                      const copyFeatures: FeatureInterface[] = [].concat(
                          features,
                      );
                      const featureIndex = getIndexOfFeatureById(
                          features,
                          selectedId,
                      );
                      const [feature] = copyFeatures.splice(featureIndex, 1);
                      copyFeatures.splice(featureIndex + 1, 0, feature);
                      setFeatures(copyFeatures);
                  };

        rows.push(
            <tr key={-(features.length + 1)} className={styles.controlpanel}>
                <td onClick={addFeature}>+</td>
                <td onClick={removeFeature}>🗑️</td>
                <td onClick={moveFeatureUp}>↑</td>
                <td onClick={moveFeatureDown}>↓</td>
            </tr>,
        );
    }

    return (
        <div className={styles.float}>
            <h3>Category name:</h3>
            <input
                className={styles.categorynameinput}
                value={category.name}
                onKeyDown={categoryPreventFormSubmission}
                onChange={onChangeCategoryName}
                disabled={isPending}
            ></input>
            <h3>Features</h3>
            <table className={styles.featurestable}>
                <tbody>{rows}</tbody>
            </table>
        </div>
    );
}
