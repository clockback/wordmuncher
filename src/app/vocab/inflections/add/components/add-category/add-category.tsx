import { Dispatch, JSX, SetStateAction, useState } from "react";

import styles from "./add-category.module.css";

interface AddCategoryProps {
    categoryName: string;
    setCategoryName: Dispatch<SetStateAction<string>>;
    features: string[];
    setFeatures: Dispatch<SetStateAction<string[]>>;
    isPending: boolean;
}

export default function AddCategory({
    categoryName,
    setCategoryName,
    features,
    setFeatures,
    isPending,
}: AddCategoryProps) {
    const [isAddingFeature, setIsAddingFeature] = useState(false);
    const [isModifyingFeature, setIsModifyingFeature] = useState(false);
    const [editingText, setEditingText] = useState("");
    const [selectedI, setSelectedI] = useState(null);

    const onChangeEditingText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingText(e.target.value);
    };

    const onBlurModifyFeatureInput = () => {
        setIsModifyingFeature(false);
        const trimEditingText = editingText.trim();
        if (
            trimEditingText.length === 0 ||
            features.includes(trimEditingText)
        ) {
            return;
        }
        const copyFeatures = [].concat(features);
        copyFeatures[selectedI] = editingText;
        setFeatures(copyFeatures);
    };

    const rows = [];
    let featureI = 0;
    for (const feature of features) {
        const className = featureI === selectedI ? styles.selected : null;
        const onClickFeature = () => {
            if (!isModifyingFeature && selectedI === featureI) {
                setIsModifyingFeature(true);
                setEditingText(feature);
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
            cellContents = feature;
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
        setCategoryName(e.target.value);
    };

    const onBlurAddFeatureInput = () => {
        setIsAddingFeature(false);
        const trimEditingText = editingText.trim();
        if (
            trimEditingText.length === 0 ||
            features.includes(trimEditingText)
        ) {
            return;
        }
        const copyFeatures = [].concat(features);
        copyFeatures.push(editingText);
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
                      const copyFeatures = [].concat(features);
                      copyFeatures.splice(selectedI, 1);
                      setFeatures(copyFeatures);
                      setSelectedI(null);
                  };

        const moveFeatureUp =
            selectedI === null || selectedI === 0 || isPending
                ? null
                : () => {
                      const copyFeatures = [].concat(features);
                      const [feature] = copyFeatures.splice(selectedI, 1);
                      copyFeatures.splice(selectedI - 1, 0, feature);
                      setFeatures(copyFeatures);
                      setSelectedI(Math.max(0, selectedI - 1));
                  };

        const moveFeatureDown =
            selectedI === null || selectedI === features.length - 1 || isPending
                ? null
                : () => {
                      const copyFeatures = [].concat(features);
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
                value={categoryName}
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
