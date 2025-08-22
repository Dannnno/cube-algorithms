import React from "react";
import styles, { credits } from './credits.module.scss';

/**
 * Component that displays resources that need attribution, e.g. 
 * icons licensed via CC By 3.0
 */
export const Credits: React.FC<{}> = props => {
    return (
      <div className={credits}>
        <h4>Credits</h4>
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Resource Name</th>
              <th>Creator</th>
              <th>Retrieved From</th>
              <th>License</th>
            </tr>
          </thead>
          <tbody>
            <ImageCreditRow 
                resource="/src/assets/clockwise-rotation.svg"
                resourceName="Clockwise Rotation Icon"
                resourceUrl="https://game-icons.net/1x1/delapouite/clockwise-rotation.html"
                resourceCreator="Delapouite"
                resourceCreatorUrl="https://delapouite.com/"
                retrievedFrom="game-icons.net"
                retrievedFromUrl="https://game-icons.net"
                license={License.CcBy30}
            />
            <ImageCreditRow 
                resource="/src/assets/anticlockwise-rotation.svg"
                resourceName="Anticlockwise Rotation Icon"
                resourceUrl="https://game-icons.net/1x1/delapouite/anticlockwise-rotation.html"
                resourceCreator="Delapouite"
                resourceCreatorUrl="https://delapouite.com/"
                retrievedFrom="game-icons.net"
                retrievedFromUrl="https://game-icons.net"
                license={License.CcBy30}
            />
            <ImageCreditRow 
                resource="/src/assets/cycle.svg"
                resourceName="Cycle Icon"
                resourceUrl="https://game-icons.net/1x1/lorc/cycle.html"
                resourceCreator="Lorc"
                resourceCreatorUrl="https://lorcblog.blogspot.com/"
                retrievedFrom="game-icons.net"
                retrievedFromUrl="https://game-icons.net"
                license={License.CcBy30}
            />
            <ImageCreditRow 
                resource="/src/assets/progression.svg"
                resourceName="Progression Icon"
                resourceUrl="https://game-icons.net/1x1/delapouite/progression.html"
                resourceCreator="Delapouite"
                resourceCreatorUrl="https://delapouite.com/"
                retrievedFrom="game-icons.net"
                retrievedFromUrl="https://game-icons.net"
                license={License.CcBy30}
            />
          </tbody>
        </table>
      </div>
    );
};
export default Credits;

type Url = string;

enum License {
    CcBy30 = "CC BY 3.0"
}

const LicenseUrls: Record<License, Url> = {
    [License.CcBy30]: "https://creativecommons.org/licenses/by/3.0/"
}

interface ICreditRowProps {
    readonly resource: unknown;
    readonly resourceName: string;
    readonly resourceUrl: Url;
    readonly resourceCreator: string;
    readonly resourceCreatorUrl: Url;
    readonly retrievedFrom: string;
    readonly retrievedFromUrl: Url;
    readonly license: License;
}

interface IImageCreditRowProps extends ICreditRowProps {
    readonly resource: string;
}

const ImageCreditRow: React.FC<IImageCreditRowProps> = props => {
    const { 
        resource, 
        resourceName, resourceUrl, 
        resourceCreator, resourceCreatorUrl,
        retrievedFrom, retrievedFromUrl,
        license
    } = props;
    return (
        <tr>
            <td>
                <a href={resourceUrl}>
                    <img src={resource} width={50} height={50}/><br/>
                </a>
            </td>
            <td>
                <a href={resourceUrl}>{resourceName}</a>
            </td>
            <td>
                <a href={resourceCreatorUrl}>{resourceCreator}</a>
            </td>
            <td>
                <a href={retrievedFromUrl}>{retrievedFrom}</a>
            </td>
            <td>
                <a href={LicenseUrls[license]}>{license}</a>
            </td>
        </tr>
    );
}
