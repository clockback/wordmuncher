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
    const [selectedI, setSelectedI] = useState<number | null>(null);

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
        copyFeatures[selectedI] = {
            name: editingText,
            id: features[selectedI].id,
        };
        setFeatures(copyFeatures);
    };

    const rows = [];
    let featureI = 0;
    for (const feature of features) {
        const className = featureI === selectedI ? styles.selected : null;
        const onClickFeature = () => {
            if (!isModifyingFeature && selectedI === featureI) {
                setIsModifyingFeature(true);
                setEditingText(feature.name);
            } else {
                setSelectedI(featureI);
            }
        };
        let cellContents: JSX.Element | string;
        if (isModifyingFeature && selectedI === featureI) {
            cellContents = (
                <input
                    className={styles.featureinput}
                    autoFocus
                    onBlur={onBlurModifyFeatureInput}
                    onKeyDown={featurePreventFormSubmission}
                    value={editingText}
                    onChange={onChangeEditingText}
                    disabled={isPending}
                ></input>
            );
        } else {
            cellContents = feature.name;
        }
        rows.push(
            <tr key={featureI}>
                <td colSpan={4} onClick={onClickFeature} className={className}>
                    {cellContents}
                </td>
            </tr>,
        );
        featureI++;
    }

    function categoryPreventFormSubmission(
        e: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (e.code == "Enter") {
            e.preventDefault();
        }
    }

    function featurePreventFormSubmission(
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
        copyFeatures.push({ name: editingText, id: null });
        setSelectedI(features.length);
        setFeatures(copyFeatures);
    };

    if (isAddingFeature) {
        rows.push(
            <tr key={-1}>
                <td colSpan={4}>
                    <input
                        className={styles.featureinput}
                        autoFocus
                        onBlur={onBlurAddFeatureInput}
                        onKeyDown={featurePreventFormSubmission}
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
                  setSelectedI(null);
                  setEditingText("");
                  setIsAddingFeature(true);
              };

        const removeFeature =
            selectedI === null || isPending
                ? null
                : () => {
                      const copyFeatures: FeatureInterface[] = [].concat(
                          features,
                      );
                      copyFeatures.splice(selectedI, 1);
                      setFeatures(copyFeatures);
                      setSelectedI(null);
                  };

        const moveFeatureUp =
            selectedI === null || selectedI === 0 || isPending
                ? null
                : () => {
                      const copyFeatures: FeatureInterface[] = [].concat(
                          features,
                      );
                      const [feature] = copyFeatures.splice(selectedI, 1);
                      copyFeatures.splice(selectedI - 1, 0, feature);
                      setFeatures(copyFeatures);
                      setSelectedI(Math.max(0, selectedI - 1));
                  };

        const moveFeatureDown =
            selectedI === null || selectedI === features.length - 1 || isPending
                ? null
                : () => {
                      const copyFeatures: FeatureInterface[] = [].concat(
                          features,
                      );
                      const [feature] = copyFeatures.splice(selectedI, 1);
                      copyFeatures.splice(selectedI + 1, 0, feature);
                      setFeatures(copyFeatures);
                      setSelectedI(
                          Math.min(features.length - 1, selectedI + 1),
                      );
                  };

        rows.push(
            <tr key={-1} className={styles.controlpanel}>
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
