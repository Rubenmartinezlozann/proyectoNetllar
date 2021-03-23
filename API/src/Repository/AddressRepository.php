<?php

namespace App\Repository;

use App\Entity\Address;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @method Address|null find($id, $lockMode = null, $lockVersion = null)
 * @method Address|null findOneBy(array $criteria, array $orderBy = null)
 * @method Address[]    findAll()
 * @method Address[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AddressRepository extends ServiceEntityRepository
{
    private $manager;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $manager)
    {
        parent::__construct($registry, Address::class);
        $this->manager = $manager;
    }

    public function suggestAddress($addressText)
    {
        // $addressCombinationsArray = $this->getAddressCombinations($this->getWordsOrderCombinations(), $this->getWordsLenghtSequences($words, $dbAddressData));
        $dbAddressData = $this->findAll();
        $words = $this->getWords($addressText);
        $sequencesArray = $this->getWordsSequences();
        $lenghtSequencesArray = $this->getWordsLenghtSequences($words, $dbAddressData, $sequencesArray);
        return $this->getSuggestedAddress($lenghtSequencesArray, $words, $dbAddressData);
    }

    private function getWords($text)
    {
        $address = [];
        $substringStart = 0;
        $isStartSet = false;
        for ($i = 0; $i < strlen($text); $i++) {
            if ((substr($text, $i, 1) === ' ' || substr($text, $i, 1) === ',') && $isStartSet) {
                $address[] = substr($text, $substringStart, $i - $substringStart);
                $isStartSet = false;
                $substringStart = null;
            } elseif (substr($text, $i, 1) !== ' ' && substr($text, $i, 1) !== ',' && !$isStartSet) {
                $substringStart = $i;
                $isStartSet = true;
            }
        }
        $isStartSet ? $address[] = substr($text, $substringStart, strlen($text) - $substringStart) : true;
        return $address;
    }

    private function getWordsSequences()
    {
        $wordsOrder = [];
        $wordsSort = ['street', 'province', 'municipality', 'typeRoad'];
        foreach ($wordsSort as $frist) {
            foreach ($wordsSort as $second) {
                if ($frist !== $second) {
                    foreach ($wordsSort as $third) {
                        if ($second !== $third && $third !== $frist) {
                            foreach ($wordsSort as $key => $fourth) {
                                if ($fourth !== $frist && $fourth !== $second && $fourth !== $third) {
                                    // $wordsOrder[] = [$frist => null, $second => null, $third => null, $fourth => null];
                                    $wordsOrder[] = [$frist, $second, $third, $fourth];
                                }
                            }
                        }
                    }
                }
            }
        }
        return $wordsOrder;
    }

    /* private function getWordsLenghtCombinations($words, $addressData)
    {
        $wordsLenght = [];
        $maxWords = $this->getMaxWordsNumber($addressData, count($words));

        for ($wordsStreet = $maxWords['street']; $wordsStreet >= 0; $wordsStreet--) {
            for ($wordsProvince = $maxWords['province']; $wordsProvince >= 0; $wordsProvince--) {
                for ($wordsMunicipality = $maxWords['municipality']; $wordsMunicipality >= 0; $wordsMunicipality--) {
                    for ($wordsTypeRoad = $maxWords['typeRoad']; $wordsTypeRoad  >= 0; $wordsTypeRoad--) {
                        $sum = $wordsStreet + $wordsProvince + $wordsMunicipality + $wordsTypeRoad;
                        if (count($words) === $sum) {
                            $wordsLenght[] = ['street' => $wordsStreet, 'province' => $wordsProvince, 'municipality' => $wordsMunicipality, 'typeRoad' => $wordsTypeRoad];
                        }
                    }
                }
            }
        }
        return $wordsLenght;
    } */

    private function getWordsLenghtSequences($words, $addressData, $wordsSequences)
    {
        $wordsLenght = [];
        $maxWords = $this->getMaxWordsNumber($addressData, count($words));
        foreach ($wordsSequences as $wordSequence) {
            for ($words1 = $maxWords[$wordSequence[0]]; $words1 >= 0; $words1--) {
                for ($words2 = $maxWords[$wordSequence[1]]; $words2 >= 0; $words2--) {
                    for ($words3 = $maxWords[$wordSequence[2]]; $words3 >= 0; $words3--) {
                        for ($words4 = $maxWords[$wordSequence[3]]; $words4  >= 0; $words4--) {
                            $sum = $words1 + $words2 + $words3 + $words4;
                            if (count($words) === $sum) {
                                $wordsCombinations[] = [$wordSequence[0] => $words1, $wordSequence[1] => $words2, $wordSequence[2] => $words3, $wordSequence[3] => $words4];
                            }
                        }
                    }
                }
            }
        }
        return $wordsCombinations;
    }

    private function getMaxWordsNumber($data, $maxValue)
    {
        $maxWords = [
            'province' => 0,
            'municipality' => 0,
            'typeRoad' => 0,
            'street' => 0
        ];

        foreach ($data as $value) {
            $maxWords['province'] = count($this->getWords($value->getProvincia())) > $maxWords['province'] ? (count($this->getWords($value->getProvincia())) <= $maxValue ? count($this->getWords($value->getProvincia())) : $maxValue) : $maxWords['province'];
            $maxWords['municipality'] = count($this->getWords($value->getMunicipio())) > $maxWords['municipality'] ? (count($this->getWords($value->getMunicipio())) <= $maxValue ? count($this->getWords($value->getMunicipio())) : $maxValue) : $maxWords['municipality'];
            $maxWords['typeRoad'] = (count($this->getWords($value->getTipovia())) > $maxWords['typeRoad'] ? (count($this->getWords($value->getTipovia())) <= $maxValue ? count($this->getWords($value->getTipovia())) : $maxValue) : $maxWords['typeRoad']);
            $maxWords['street'] = count($this->getWords($value->getCalle())) > $maxWords['street'] ? (count($this->getWords($value->getCalle())) <= $maxValue ? count($this->getWords($value->getCalle())) : $maxValue) : $maxWords['street'];
        }

        return $maxWords;
    }

    /* private function getAddressCombinations($wordsOrderArray, $wordsLenghtArray)
    {
        foreach ($wordsOrderArray as $orderArray) {
            foreach ($wordsLenghtArray as $lenghtArray) {
                $aux = $orderArray;
                foreach ($aux as $key => $valueOrder) {
                    $aux[$key] = $lenghtArray[$key];
                }
                $combinations[] = $aux;
            }
        }

        return $combinations;
    } */

    /* private function getSuggestedAddress($combinations, $words, $dbAddressData)
    {
        $data = [];
        foreach ($combinations as $combination) {
            $aux = $combination;
            $sugestedAddress = [];
            $index = 0;
            foreach ($aux as $key => $value) {
                $text = '';
                for ($i = $index; $i < $value + $index; $i++) {
                    $text .= $words[$index];
                    $text .= $index < ($value + $index - 1) ? ' ' : '';
                }
                $index = $i;
                $aux[$key] = $text;
                $sugestedAddress[] = $aux;
            }

            foreach ($sugestedAddress as $sugestedValue) {
                foreach ($dbAddressData as $dbValue) {
                    if (str_contains(strtolower($dbValue->getProvincia()), strtolower($sugestedValue['province'])) && str_contains(strtolower($dbValue->getMunicipio()), strtolower($sugestedValue['municipality'])) && str_contains(strtolower($dbValue->getTipovia()), strtolower($sugestedValue['typeRoad'])) && str_contains(strtolower($dbValue->getCalle()), strtolower($sugestedValue['street']))) {
                        if ($aux !== $dbValue->getCalle()) {
                            $data[] = [
                                strtoupper(substr($dbValue->getTipovia(), 0, 1)) . strtolower(substr($dbValue->getTipovia(), 1)),
                                strtoupper(substr($dbValue->getCalle(), 0, 1)) . strtolower(substr($dbValue->getCalle(), 1)),
                                strtoupper(substr($dbValue->getMunicipio(), 0, 1)) . strtolower(substr($dbValue->getMunicipio(), 1)),
                                strtoupper(substr($dbValue->getProvincia(), 0, 1)) . strtolower(substr($dbValue->getProvincia(), 1)),
                                $dbValue->getNumero()
                            ];
                        }
                    }
                    $aux = $dbValue->getCalle();
                }
            }
        }
        return !empty($data) ? $data : [];
    } */

    private function getSuggestedAddress($combinations, $words, $dbAddressData)
    {
        $data = [];
        foreach ($combinations as $combination) {
            $sugestedValue = $combination;
            $index = 0;
            foreach ($combination as $key => $value) {
                $text = '';
                for ($i = $index; $i < $value + $index; $i++) {
                    $text .= $words[$i] . ' ';
                }
                $text = substr($text, 0, strlen($text)-1);
                echo ($text . '|');
                $index = $i;
                $sugestedValue[$key] = $text !== null ? $text : '';
            }
            // foreach ($sugestedAddress as $sugestedValue) {
            $aux = '';
            foreach ($dbAddressData as $dbValue) {
                if (str_contains(strtolower($dbValue->getProvincia()), strtolower($sugestedValue['province'])) && str_contains(strtolower($dbValue->getMunicipio()), strtolower($sugestedValue['municipality'])) && str_contains(strtolower($dbValue->getTipovia()), strtolower($sugestedValue['typeRoad'])) && str_contains(strtolower($dbValue->getCalle()), strtolower($sugestedValue['street']))) {
                    if ($aux !== $dbValue->getCalle()) {
                        $data[] = [
                            strtoupper(substr($dbValue->getTipovia(), 0, 1)) . strtolower(substr($dbValue->getTipovia(), 1)),
                            strtoupper(substr($dbValue->getCalle(), 0, 1)) . strtolower(substr($dbValue->getCalle(), 1)),
                            strtoupper(substr($dbValue->getMunicipio(), 0, 1)) . strtolower(substr($dbValue->getMunicipio(), 1)),
                            strtoupper(substr($dbValue->getProvincia(), 0, 1)) . strtolower(substr($dbValue->getProvincia(), 1)),
                            $dbValue->getNumero()
                        ];
                    }
                }
                $aux = $dbValue->getCalle();
            }
            // }
        }
        return !empty($data) ? $data : [];
    }

    /* private function getSuggestedAddress($words = [], $addressData)
    {
        if (!empty($words)) {
            $wordsToSort = ['street', 'province', 'municipality', 'typeRoad'];

            foreach ($wordsToSort as $frist) {
                foreach ($wordsToSort as $second) {
                    foreach ($wordsToSort as $third) {
                        foreach ($wordsToSort as $fourth) {
                            if ($frist !== $second && $frist !== $third && $frist !== $fourth && $second !== $third && $second !== $fourth && $third !== $fourth) {
                                $wordsOrder[] = [$frist => null, $second => null, $third => null, $fourth => null];
                            }
                        }
                    }
                }
            }
            echo $wordsOrder; 

            $maxWords = $this->getMaxWordsNumber($addressData, count($words));
             for ($wordsStreet = $maxWords['street']; $wordsStreet >= 0; $wordsStreet--) {
                for ($wordsProvince = $maxWords['province']; $wordsProvince >= 0; $wordsProvince--) {
                    for ($wordsMunicipality = $maxWords['municipality']; $wordsMunicipality >= 0; $wordsMunicipality--) {
                        for ($wordsTypeRoad = $maxWords['typeRoad']; $wordsTypeRoad  >= 0; $wordsTypeRoad--) {
                            $sum = $wordsStreet + $wordsProvince + $wordsMunicipality + $wordsTypeRoad;
                            if (count($words) === $sum) {
                                $wordsLenght[] = ['street' => $wordsStreet, 'province' => $wordsProvince, 'municipality' => $wordsMunicipality, 'typeRoad' => $wordsTypeRoad];
                            }
                        }
                    }
                }
            }

            foreach ($wordsOrder as $orderArray) {
                foreach ($wordsLenght as $lenghtArray) {
                    $aux = $orderArray;
                    foreach ($aux as $key => $valueOrder) {
                        $valueOrder = $lenghtArray[$key];
                        //si no funciona cambiar linea arriba
                    }
                    $combinations[] = $aux;
                }
            }

            foreach ($combinations as $combination) {
                $index = 0;
                $aux = $combination;
                $address = [];
                foreach ($aux as $key => $value) {
                    $text = '';
                    for ($index; $index < $value + $index; $index++) {
                        $text += $words[$index];
                        $text += $index < ($value + $index - 1) ? ' ' : '';
                    }
                    $value = $text;
                    $address[] = $aux;
                }
                foreach ($address as $key => $value) {
                    if (str_contains($addressData['PROVINCIA'], $value['province']) && str_contains($addressData['MUNICIPIO'], $value['municipality']) && str_contains($addressData['TIPOVIA'], $value['typeRoad']) && str_contains($addressData['CALLE'], $value['street'])) {
                        $data[] = [$addressData['TIPOVIA'], $addressData['CALLE'], $addressData['MUNICIPIO'], $addressData['PROVINCIA']];
                    }
                }
            }
        } else {
            $data = [];
        }
        return $data;
    } */

    /* private function executeNativeQuery($text, $params = [])
    {
        $rsm = new ResultSetMapping();
        $query = $this->manager->createNativeQuery($text, $rsm);
        for ($i = 0; $i < count($params); $i++) {
            $query->setParameter($i, $params = [$i]);
        }

        return $query->getResult();
    } */

    /* return $this->createQueryBuilder('a')
            ->select('a.PROVINCIA, a.MUNICIPIO, a.TIPOVIA, a.CALLE')
            ->andWhere('a.PROVINCIA like %:prov')
            ->andWhere('a.MUNICIPIO like %:mun')
            ->andWhere('a.TIPOVIA like %:typ')
            ->andWhere('a.CALLE like %:street')
            ->setParameter('prov', $province)
            ->setParameter('mun', $municipality)
            ->setParameter('typ', $typeRoad)
            ->setParameter('street', $street)
            ->orderBy('a.Calle', 'ASC')
            ->setMaxResults(6)
            ->getQuery()
            ->getResult(); */

    /* public function findOneBySomeField($value): ?Address
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult();
    } */
}
